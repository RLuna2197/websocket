import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    private readonly users = [
        {
        userId: 1,
        username: 'luna',
        password: 'admin',
        },
        {
        userId: 2,
        username: 'carlos',
        password: 'admin',
        },
    ];

    async findOne(username: string) {
        return this.users.find(user => user.username === username);
    }
}
