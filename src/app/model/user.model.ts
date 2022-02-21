
export class User {

  id: number;
  firstname: string;
  surname: string;
  username: string;
  password: string;
  code: string;
  licences: string[];
  roles: string[];


  static fromJson(json, username, passwod): User {
    if (json) {
      const id = json['id'];
      const user = new User(id);
      user.firstname = json['firstname'];
      user.surname = json['surname'];
      user.code = json['session'] ? json['session']['session_eppn'] : '';
      user.licences = json['licenses'] || json['labels'] || [];
      user.roles = json['roles'] || [];
      user.username = username;
      user.password = passwod;
      return user;
    }
    return null;
  }

  constructor(id: number) {
    this.id = id;
  }

  isLoggedIn(): boolean {
    return this.id > -1;
  }




}
