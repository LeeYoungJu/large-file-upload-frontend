import axios, { Axios, AxiosInstance, AxiosResponse, AxiosStatic } from 'axios';

class Api {
	http: AxiosInstance | null = null;

	constructor(axios: AxiosStatic, baseURL: string) {
		this.http = axios.create({
			baseURL,
		});
	}

	getAxios() {
		return this.http;
	}	

	setBaseHeader(userConfig = {}) {
		const config = {
			...userConfig,
            ...!('headers' in userConfig) && {
                headers: {
                    'Content-Type': 'application/json',
                }
            },
		};

		return config;
	}

	get(path: string, params = {}, config = {}) {
        if(this.http === null) {
            return;
        }
		config = this.setBaseHeader(config);
		return this.http.get(path, { params, ...config });
	}

	post(path: string, params = {}, config = {}): Promise<AxiosResponse> | null {
        if(this.http === null) {
            return null;
        }
		config = this.setBaseHeader(config);
		return this.http.post(path, params, config);
	}

	async getAsync(path: string, params = {}, config = {}) {
        if(this.http === null) {
            return;
        }
		config = this.setBaseHeader(config);
		const response = await this.http.get(path, { params, ...config });
		return response;
	}
}

const apiService = new Api(axios, `${process.env.REACT_APP_API_URL}/`);
export default apiService;
