const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


const apiRoutes = require('./routes/api');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Neo Financial API Documentation'
}));


app.use('/api', apiRoutes);


app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Neo Financial API',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});

module.exports = app; 