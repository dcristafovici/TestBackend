export interface UserRegisterModel {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location: string;
  position: string;
}

export interface UserLoginModel {
  email: string;
  password: string;
}
