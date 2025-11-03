/**
 * User Model
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || data._id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.role = data.role || 'customer';
    this.avatar = data.avatar || null;
    this.addresses = data.addresses || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get initials() {
    const first = this.firstName.charAt(0).toUpperCase();
    const last = this.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      role: this.role,
      avatar: this.avatar,
      addresses: this.addresses,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default User;