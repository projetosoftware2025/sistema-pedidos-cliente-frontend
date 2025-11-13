
import { host } from "../../config/appConfig";
import { ResponseInterface } from "../../models/interfaces/ResponseInterface";

export const loginService = async (
	usuario: string,
	senha: string
): Promise<ResponseInterface> => {
	try {
		const response = await fetch(
			`${host}/user/signInUser`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					usuario,
					senha,
				}),
			}
		);

		if (!response.ok) {
			return {
				status: "error",
				message: "Resposta vazia do servidor.",
				data: null,
			};
		}

		const responseData = await response.json();

		// console.log("response: ", responseData);

		if (responseData) {
			return responseData
		}

		return {
			status: "error",
			message: "Resposta vazia do servidor.",
			data: null,
		};
	} catch (error) {
		console.error("Erro no signinUser:", error);
		return {
			status: "error",
			message: "Erro na comunicação com o servidor.",
			data: null,
		};
	}
};
