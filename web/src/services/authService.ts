import userService from './userService';

class AuthService {
	authHeader() {
		const token = userService.getToken();

		return {
			Authorization: 'Bearer ' + token,
			'Content-Type': 'application/json',
		};
	}

	async login(username: string, password: string) {
		return Promise.resolve({
			username,
			password,
			access_token: '1234',
			expirationTime: 10000000,
			expires_in: 64000,
			roles: [],
		});
	}
}
export default new AuthService();
