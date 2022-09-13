class UserService {
	getUsername() {
		let userStorage = localStorage.getItem('username');

		if (userStorage) userStorage = JSON.parse(userStorage);

		return userStorage;
	}

	getToken() {
		const tokenStorage = localStorage.getItem('token');

		if (tokenStorage) return tokenStorage;
	}

	getRoles() {
		const rolesStorage = localStorage.getItem('roles');

		if (rolesStorage) return rolesStorage.split(',');
	}

	checkExistRole(roles: string[]) {
		return this.getRoles()?.some((role) => roles.includes(role));
	}
}

export default new UserService();
