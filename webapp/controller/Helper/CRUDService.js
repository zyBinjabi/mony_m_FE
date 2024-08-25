sap.ui.define([], function () {
    "use strict";

    return class CRUDService {

        constructor(baseURL, accessToken = null) {
            this.baseURL = baseURL;
            this.accessToken = accessToken;
        }

        setAccessToken(token) {
            this.accessToken = token;
        }

        // async create(endpoint, data, isFormUrlEncoded = false) {
        //     try {
        //         const response = await fetch(this.baseURL + endpoint, {
        //             method: "POST",
        //             headers: this._getHeaders(isFormUrlEncoded),
        //             body: this._getBody(data, isFormUrlEncoded)
        //         });

        //         return await this._handleResponse(response);
        //     } catch (error) {
        //         console.error("Create operation failed:", error);
        //         throw error;
        //     }
        // }


        async create(endpoint, data, isFormUrlEncoded = false) {
            try {
                // Determine if data is FormData
                const isFormData = data instanceof FormData;
                console.log(
                    '\n _getHeaders',
                    this._getHeaders(isFormData ? false : isFormUrlEncoded),
                    '\n _getBody',
                    this._getBody(data, isFormUrlEncoded),
                )
                const response = await fetch(this.baseURL + endpoint, {
                    method: "POST",
                    headers: this._getHeaders(isFormUrlEncoded, isFormData),
                    body: this._getBody(data, isFormUrlEncoded)
                });

                return await this._handleResponse(response);
            } catch (error) {
                console.error("Create operation failed:", error);
                throw error;
            }
        }


        async read(endpoint, params = {}) {
            try {

                // Convert params object to a query string
                const queryString = new URLSearchParams(params).toString();

                // Append the query string to the endpoint
                const url = `${this.baseURL}${endpoint}?${queryString}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: this._getHeaders()
                });

                return await this._handleResponse(response);
            } catch (error) {
                console.error("Read operation failed:", error);
                throw error;
            }
        }

        async update(endpoint, data, isFormUrlEncoded = false) {
            try {
                const response = await fetch(this.baseURL + endpoint, {
                    method: "PUT",
                    headers: this._getHeaders(isFormUrlEncoded),
                    body: this._getBody(data, isFormUrlEncoded)
                });

                return await this._handleResponse(response);
            } catch (error) {
                console.error("Update operation failed:", error);
                throw error;
            }
        }

        async delete(endpoint) {
            try {
                const response = await fetch(this.baseURL + endpoint, {
                    method: "DELETE",
                    headers: this._getHeaders()
                });

                return await this._handleResponse(response);
            } catch (error) {
                console.error("Delete operation failed:", error);
                throw error;
            }
        }

        // _getHeaders(isFormUrlEncoded = false) {
        //     const headers = {
        //         "Accept": "application/json"
        //     };

        //     if (this.accessToken) {
        //         headers["Authorization"] = `Bearer ${this.accessToken}`;
        //     }

        //     if (isFormUrlEncoded) {
        //         headers["Content-Type"] = "application/x-www-form-urlencoded";
        //     } else {
        //         headers["Content-Type"] = "application/json";
        //     }

        //     return headers;
        // }

        // _getBody(data, isFormUrlEncoded) {
        //     if (isFormUrlEncoded) {
        //         return new URLSearchParams(data).toString();
        //     } else {
        //         // return JSON.stringify(data);
        //         return data;
        //     }
        // }


        _getHeaders(isFormUrlEncoded = false, isFormData = false) {
            const headers = {
                "Accept": "application/json"
            };

            if (this.accessToken) {
                headers["Authorization"] = `Bearer ${this.accessToken}`;
            }

            // Only set Content-Type if it's not FormData
            if (isFormUrlEncoded) {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
            } else if (!isFormData) {
                headers["Content-Type"] = "application/json";
            }

            return headers;
        }


        _getBody(data, isFormUrlEncoded) {
            if (isFormUrlEncoded) {
                // Convert data to URL-encoded string if required
                return new URLSearchParams(data).toString();
            } else {
                // Send raw data (e.g., JSON or FormData)
                return typeof data === 'object' && !(data instanceof FormData)
                    ? JSON.stringify(data)
                    : data;
            }
        }

        async _handleResponse(response) {
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = this._getErrorMessage(response.status, errorData);
                throw new Error(errorMessage);
            }

            return await response.json();
        }

        _getErrorMessage(status, errorData) {
            switch (status) {
                case 400:
                    return `Validation Error: ${errorData.detail}`;
                case 401:
                    return "Unauthorized: Please check your credentials.";
                case 403:
                    return "Forbidden: You do not have permission to perform this action.";
                case 404:
                    return `Not Found: ${errorData.detail}`;
                case 500:
                    return "Internal Server Error: Please try again later.";
                default:
                    return `Unexpected Error: ${status} - ${errorData.detail || "Unknown error"}`;
            }
        }
    };
});
