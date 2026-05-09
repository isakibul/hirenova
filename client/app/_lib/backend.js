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
export async function postToBackend(path, payload, init) {
    try {
        const response = await getBackendApi().post(path, payload, {
            headers: init?.headers,
        });
        return {
            body: response.data,
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
        };
    }
    catch (error) {
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
}
export async function getFromBackend(path, init) {
    try {
        const response = await getBackendApi().get(path, {
            headers: init?.headers,
            params: init?.params,
        });
        return {
            body: response.data,
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
        };
    }
    catch (error) {
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
}
export async function putToBackend(path, payload, init) {
    try {
        const response = await getBackendApi().put(path, payload, {
            headers: init?.headers,
        });
        return {
            body: response.data,
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
        };
    }
    catch (error) {
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
}
export async function patchToBackend(path, payload, init) {
    try {
        const response = await getBackendApi().patch(path, payload, {
            headers: init?.headers,
        });
        return {
            body: response.data,
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
        };
    }
    catch (error) {
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
}
export async function deleteFromBackend(path, init) {
    try {
        const response = await getBackendApi().delete(path, {
            headers: init?.headers,
        });
        return {
            body: response.data,
            status: response.status,
            ok: response.status >= 200 && response.status < 300,
        };
    }
    catch (error) {
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
}
