
export class User {

  // password: string;
  id: number;
  authenticated: boolean = false;
  name: string;
  uid: string;
  licences: string[];
  roles: string[];
  eppn: string;
  actions: string[] = [];
  tokenId: string;
  expirationTime: number;

  static fromJson(json): User {
    if (json) {
      const user = new User();
      user.id = json['id'];
      user.authenticated = !!json['authenticated'];
      user.name = (json['name'] || '').trim();
      user.uid = json['uid'];
      user.roles = json['roles'] || [];
      user.licences = json['licenses'] || json['labels'] || [];
      if (json['session']) {
        user.eppn = json['session']['session_eppn'] || '';
        user.tokenId = json['session']['token_id'];
        user.expirationTime = json['session']['expiration_time'];
      }
      // user.firstname = json['firstname'];
      // user.surname = json['surname'];
      // user.username = username;
      // user.password = passwod;
      return user;
    }
    return null;
  }


  isLoggedIn(): boolean {
    return (this.id && this.id > -1) || this.authenticated;
  }




}
