/**
 * @function getCEP
 * @author Maykel Esser
 * @description This function is responsible for returning a valid address from a CEP (Brazilian ZIPCODE) number.
 * - The updated_at field must contain the current date in ISO format.
 * - The data field must contain the address information (cep, city, neighborhood, state, street, service).
 * @param {*} req - The request object.
 * @param {String} req.query.cep - The CEP number.
 * @param {*} res - The response object.
 * @returns {Object} - Returns an object with the status of the application.
 * @see https://brasilapi.com.br/docs#tag/CEP
 */
export default async function getCEP(req, res) {
    const { cep } = req.query;

    if (!cep) {
        return res.status(400).json({
            error: "CEP is required",
        });
    }

    const updatedAt = new Date().toISOString();
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        return res.status(400).json({
            updated_at: updatedAt,
            error: {
                message:
                    "The API returned an invalid response or the CEP is invalid.",
            },
        });
    }

    const responseBody = await response.json();

    if (responseBody.errors) {
        return res.status(400).json({
            updated_at: updatedAt,
            error: {
                message: responseBody.message,
                errors: responseBody.errors,
            },
        });
    }

    return res.status(200).json({
        updated_at: updatedAt,
        data: responseBody,
    });
}
