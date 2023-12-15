class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
  }
  static fromRawError(rawError) {
    switch(rawError.code) {
      case "23505":
        return new DuplicateKeyError(rawError.message);
      case "23503":
        return new InsertUpdateKeyViolateError(rawError.message);
      default:
        return null
    }
  }
}
class DuplicateKeyError extends DatabaseError {
  constructor(message) {
    super(message);
    this.name = "DuplicateKeyError";
  }

 
}

class InsertUpdateKeyViolateError extends DatabaseError {
  constructor(message) {
    super(message);
    this.name = "InsertUpdateKeyViolateError";
  }
  
}
module.exports = {
  DatabaseError,
  DuplicateKeyError,
  InsertUpdateKeyViolateError,
}
