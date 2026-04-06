/**
 * Email Validation Utility
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  // Regex pattern for email validation (RFC 5322)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get error message for invalid email
 * @param email - Email address to validate
 * @returns Error message or empty string if valid
 */
export const getEmailError = (email: string): string => {
  if (!email) {
    return "Email is required";
  }

  if (!email.includes("@")) {
    return "Email must contain @ symbol";
  }

  if (!email.includes(".")) {
    return "Email must contain a domain (e.g., .com)";
  }

  const parts = email.split("@");
  if (parts[0].length === 0) {
    return "Email must have a username before @";
  }

  if (parts[1].length === 0) {
    return "Email must have a domain after @";
  }

  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }

  return "";
};

/**
 * Check if email is already registered (mock check)
 * In real app, this would call backend API
 */
export const isEmailRegistered = (email: string): boolean => {
  // Get registered emails from localStorage (mock)
  const registered = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
  return registered.includes(email.toLowerCase());
};

/**
 * Register email in localStorage (mock)
 * In real app, this would be handled by backend
 */
export const registerEmail = (email: string): void => {
  const registered = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
  if (!registered.includes(email.toLowerCase())) {
    registered.push(email.toLowerCase());
    localStorage.setItem("registeredEmails", JSON.stringify(registered));
  }
};
