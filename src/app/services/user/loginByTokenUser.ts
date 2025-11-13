import { host } from "../../config/appConfig";
import { ResponseInterface } from "../../models/interfaces/ResponseInterface";

export const tokenService = async (token: string | null): Promise<ResponseInterface> => {
    try {
        if (!token) {
            return {
                status: "error",
                message: "Token não informado.",
                data: null,
            };
        }

        const response = await fetch(`${host}/user/signInUserByToken?token=${encodeURIComponent(token)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            return {
                status: "error",
                message: "Resposta vazia do servidor.",
                data: null,
            };
        }

        const responseData = await response.json();

        console.log("response: ", responseData);

        return responseData || {
            status: "error",
            message: "Resposta vazia do servidor.",
            data: null,
        };
    } catch (error) {
        console.error("Erro no signinUserByToken:", error);
        return {
            status: "error",
            message: "Erro na comunicação com o servidor.",
            data: null,
        };
    }
};
