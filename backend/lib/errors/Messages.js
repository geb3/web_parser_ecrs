'use strict';
const {register} = require('./LibError');

const Messages = {
    INVALID_OPTION: (prop, must) => `The ${prop} option must be ${must}`,
    FILE_NOT_FOUND: (file) => `File could not be found: ${file}`,
    CHILD_PROCESS_ERROR: (err, id) => `Child process with id ${id} ${err}`,
    CHILD_PROCESS_MANAGER: (err) => `Child process ${err}`,
    CHILD_PROCESS_BROADCAST_ERROR: (type, errMessage) => `Error when sending ${type} response to master process: ${errMessage}`,
    CHILD_PROCESS_INVALID_EVAL_BROADCAST: 'Script to evaluate must be a function',
    CHILD_PROCESS_NO_CHILD_PROCESS: 'Child processes were not created',
    CHILD_PROCESS_WITH_SHARDING: 'Child process manager can\'t be used with sharding, please use only one of these',
    CHILD_PROCESS_EXIST: 'Can\'t create child process in child process',
};
for (const [name, message] of Object.entries(Messages)) register(name, message);