let connectedUsers = {};

const getSharedVariable = () => connectedUsers;
const setSharedVariable = (value) => {
    connectedUsers[value.user_id] = value.io_id;
};
const removeSharedVariable = (key) => {
    delete connectedUsers[key];
}

module.exports = {
    getSharedVariable,
    setSharedVariable,
};