const appController = require('./controllers/application.controller');
console.log('Controller export:', appController);
console.log('getMyApplications exists:', !!appController.getMyApplications);
console.log('createApplication exists:', !!appController.createApplication);