const cwd = process.cwd();
const prompt = require('prompt');
const rp = require('request-promise');
const colors = require('colors/safe');
const mkdirp = require('mkdirp');
const jsonfile = require('jsonfile')
const makeRequestData = require('./makeRequestData');

const logPath = `${cwd}/logs`;
const pageSize = 500;

mkdirp(logPath, function (err) {
    if (err) {
        console.error('Error');
        process.exit(1);
    }
});

prompt.message = '';

prompt.start();

const schema = {
    properties: {
        email: {
            message: colors.green('Enter your email!'),
            required: true,
        },
        password: {
            message: colors.green('Enter your password!'),
            hidden: true,
        },
    },
};

function login(email, password) {
    const options = {
        method: 'POST',
        uri: 'https://app.slik.ai/auth/login',
        body: {
            email,
            password,
        },
        json: true,
    };

    return rp(options);
}

function getData(token, start, length = pageSize) {
    const options = {
        method: 'POST',
        uri: 'https://app.slik.ai/data-source',
        body: makeRequestData(start, length),
        headers: {
            'content-type': 'application/json;charset=UTF-8',
            'authorization': `Bearer ${token}`,
        },
        json: true,
    };

    return rp(options);
}

prompt.get(schema, (err, result) => {

    if (err) {
        return;
    }

    let pageIndex = 0;
    const { email, password } = result;
    const getDataAndWrite = (token, start) => {

        return getData(token, start).then(response => {
            const file = `${logPath}/page-${pageIndex}.json`;

            return new Promise((resolve, reject) => {
                jsonfile.writeFile(file, response, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        pageIndex += 1;
                        console.log(`Page ${pageIndex} ${colors.green('Finished!')}`);

                        resolve(response);
                    }
                });
            });
        });
    };

    login(email, password).then(response => {
        const { token = '' } = response;

        return Promise.all([
            token,
            getDataAndWrite(token, pageIndex * pageSize),
        ]);
    })
    .then(response => {
        const [ token, sourceData ] = response;
        const { noOfRecordsAvailable } = sourceData;
        let times = 10; // Math.ceil(noOfRecordsAvailable / pageSize);

        const requestNext = () => {
            const wait = parseInt(Math.random() * 1000, 10);
            console.log(colors.grey(`   wait: ${wait}ms`));

            setTimeout(() => {

                if (0 === times) {
                    console.log(colors.rainbow('Totally Finished'));
                    process.exit(0);
                }
                else {
                    getDataAndWrite(token, pageIndex * pageSize)
                        .then(response => {
                            times -= 1;
                            // recursive itself.
                            requestNext();
                        })
                        .catch(err => {
                            throw err;
                        });
               }
           }, wait);
        };

        requestNext();
    })
    .catch(function (err) {
        console.error(err);
    });
});
