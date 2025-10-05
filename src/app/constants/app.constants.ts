/**
 * Constantes da aplicação
 * Centralizando valores configuráveis para facilitar manutenção
 */

// Timeouts e delays (em milissegundos)
export const TIMEOUTS = {
  AUTH_VERIFICATION_DELAY: 2000,
  SUCCESS_REDIRECT_DELAY: 2000,
  ERROR_MESSAGE_DURATION: 5000,
  DEBOUNCE_INPUT: 300,
} as const;

// Validações de senha
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  RECOMMENDED_LENGTH: 8,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
} as const;

// Validação de email
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Por favor, preencha todos os campos',
  INVALID_EMAIL: 'Por favor, insira um email válido',
  PASSWORD_TOO_SHORT: `A senha deve ter pelo menos ${PASSWORD_RULES.MIN_LENGTH} caracteres`,
  PASSWORD_WEAK:
    'A senha deve conter pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial',
  PASSWORDS_DONT_MATCH: 'As senhas não coincidem',
  TERMS_NOT_ACCEPTED: 'Você deve aceitar os Termos de Uso e Política de Privacidade',
  UNKNOWN_ERROR: 'Erro inesperado. Tente novamente mais tarde.',
} as const;

// Limites de requisição
export const LIMITS = {
  MAX_FILE_SIZE: 5242880, // 5MB
  MAX_CHARACTER_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// Chaves do localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  CURRENT_USER: 'currentUser',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
