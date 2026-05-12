import { AbstractControl, ValidationErrors } from '@angular/forms';

export class AppValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(control.value);
    return valid ? null : { invalidEmail: true };
  }

  static password(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,15}$/.test(
        control.value
      );
    return valid ? null : { invalidPassword: true };
  }

  static name(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const valid = /^[a-zA-Z\s]{2,100}$/.test(control.value.trim());
    return valid ? null : { invalidName: true };
  }

  static phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.trim();
    const pattern = /^\+?[0-9\s\-()]+$/;
    if (!pattern.test(value)) return { invalidPhone: true };
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 6 || digitsOnly.length > 15) return { invalidPhone: true };
    return null;
  }

  static matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordKey);
      const confirmPassword = formGroup.get(confirmPasswordKey);
      if (!password || !confirmPassword) return null;
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
        return { passwordMismatch: true };
      }
      if (confirmPassword.errors) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    };
  }
}
