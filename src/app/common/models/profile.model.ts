export interface GetProfileResponse {
  userId: number;
  name: string;
  email: string;
  mobileNumber: string;
  roleId: number;
  roleName: string;
  reportingPersonName: string | null;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  mobileNumber: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}