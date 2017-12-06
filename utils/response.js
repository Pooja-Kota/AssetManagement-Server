function Response(code, description, token, result) {
    if (code != null && code != undefined && code != "") {
        this.code = code;
    }
    if (description != null && description != undefined && description != "") {
        this.description = description;
    }
    if (token != null && token != undefined && token != "") {
        this.token = token;
    }
    if (result != null && result != undefined && result != "") {
        this.result = result;
    }

}

module.exports = Response;