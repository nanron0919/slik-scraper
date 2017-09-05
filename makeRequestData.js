module.exports = (start, length) => {
    return {
        start,
        length,
        "filters": [],
        "columns": [{
                "name": "First Name",
                "data": "first_name"
            },
            {
                "name": "Last Name",
                "data": "last_name"
            },
            {
                "name": "Title",
                "data": "title"
            },
            {
                "name": "Company Name",
                "data": "coName"
            },
            {
                "name": "Employee Count",
                "data": "employeeCount"
            },
            {
                "name": "City",
                "data": "coCity"
            },
            {
                "name": "Country",
                "data": "coCountry"
            },
            {
                "name": "Industry",
                "data": "industry"
            },
            {
                "name": "Email",
                "data": "emailDisplay"
            }
        ]
    };
};