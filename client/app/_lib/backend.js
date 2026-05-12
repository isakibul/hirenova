import axios from "axios";

import { getBackendApiUrl } from "./env";

let backendApi;

function getBackendApi() {
    if (!backendApi) {
        backendApi = axios.create({
            baseURL: getBackendApiUrl(),
            timeout: 10000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    return backendApi;
}
function getUnexpectedBody() {
    return {
        message: "Unexpected backend response",
    };
}

function toBackendResult(response) {
    return {
        body: response.data,
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
    };
}

function toBackendError(error) {
    if (axios.isAxiosError(error) && error.response) {
        return {
            body: (error.response.data ?? getUnexpectedBody()),
            status: error.response.status,
            ok: false,
        };
    }

    return {
        body: getUnexpectedBody(),
        status: 500,
        ok: false,
    };
}

async function requestBackend(method, path, payload, init) {
    try {
        const response = await getBackendApi().request({
            method,
            url: path,
            data: payload,
            headers: init?.headers,
            params: init?.params,
        });
        return toBackendResult(response);
    }
    catch (error) {
        return toBackendError(error);
    }
}

export async function postToBackend(path, payload, init) {
    return requestBackend("post", path, payload, init);
}

export async function getFromBackend(path, init) {
    return requestBackend("get", path, undefined, init);
}

export async function putToBackend(path, payload, init) {
    return requestBackend("put", path, payload, init);
}

export async function patchToBackend(path, payload, init) {
    return requestBackend("patch", path, payload, init);
}

export async function deleteFromBackend(path, init) {
    return requestBackend("delete", path, undefined, init);
}
