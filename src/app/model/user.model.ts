
export class User {

  // public static DUMMY_USER = new User(-1);

  id: number;
  name: string;
  username: string;
  password: string;
  code: string;
  //labels: string[];
  licences: string[];

  static fromJson(json, username, passwod): User {
    if (json) {
      const id = json['id'];
      const user = new User(id);
      user.name = json['firstname'] + ' ' + json['surname'];
      user.code = json['session'] ? json['session']['session_eppn'] : '';
      user.licences = json['labels'] || [];
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
