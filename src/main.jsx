/* ============================================================================
   GLOBAL VARIABLES & THEME
   ============================================================================ */

:root {
  --color-oled-black: #05070a;
  --color-slate: #0f1218;
  --color-slate-light: #1f2937;
  --color-gold: #c5a059;
  --color-gold-glow: rgba(197, 160, 89, 0.2);
  --color-gold-dark: #a68243;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-pink: #ec4899;
  --color-purple: #8b5cf6;
  --color-purple-glow: rgba(139, 92, 246, 0.3);
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-border: #1f2937;

  --font-serif: 'Garamond', 'Georgia', serif;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============================================================================
   RESET & BASE STYLES
   ============================================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
}

body {
  background: linear-gradient(135deg, var(--color-oled-black) 0%, var(--color-slate) 100%);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  overflow-x: hidden;
}

input[type='text'],
input[type='password'],
textarea {
  font-family: var(--font-sans);
}

/* ============================================================================
   APP CONTAINER
   ============================================================================ */

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--color-oled-black) 0%, var(--color-slate) 100%);
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 60px;
}

.app-container::-webkit-scrollbar {
  width: 6px;
}

.app-container::-webkit-scrollbar-track {
  background: var(--color-slate);
}

.app-container::-webkit-scrollbar-thumb {
  background: var(--color-gold);
  border-radius: 3px;
}

/* ============================================================================
   PIN VAULT SCREEN
   ============================================================================ */

.pin-screen {
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.pin-vault {
  background: rgba(15, 18, 24, 0.8);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 380px;
  width: 100%;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.pin-logo {
  font-size: 64px;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pin-vault h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-gold);
  font-family: var(--font-serif);
  letter-spacing: 2px;
}

.pin-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 30px;
}

.pin-input-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 30px;
}

.pin-digit {
  width: 50px;
  height: 50px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all var(--transition-base);
  background: var(--color-slate-light);
}

.pin-error {
  color: var(--color-danger);
  font-size: 13px;
  margin-bottom: 20px;
}

.pin-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.pin-key {
  padding: 14px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pin-key:hover {
  background: var(--color-gold);
  color: var(--color-oled-black);
  transform: translateY(-2px);
}

.pin-key:active {
  transform: scale(0.95);
}

.pin-key.delete-key {
  grid-column: 1 / -1;
  font-size: 12px;
}

.pin-confirm-btn {
  width: 100%;
  padding: 16px;
  background: var(--color-gold);
  color: var(--color-oled-black);
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pin-confirm-btn:hover:not(:disabled) {
  background: var(--color-gold-dark);
  box-shadow: 0 0 20px var(--color-gold-glow);
}

.pin-confirm-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.pin-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================================================
   HEADER
   ============================================================================ */

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(15, 18, 24, 0.5);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-gold);
  font-family: var(--font-serif);
  letter-spacing: 1px;
}

.version {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-sans);
}

.privacy-toggle {
  padding: 8px 14px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.privacy-toggle:hover {
  background: var(--color-gold);
  color: var(--color-oled-black);
}

.privacy-toggle:active {
  transform: scale(0.95);
}

/* ============================================================================
   HERO SECTION (NET WORTH)
   ============================================================================ */

.hero-section {
  padding: 20px;
}

.net-worth-card {
  background: linear-gradient(135deg, var(--color-slate) 0%, rgba(197, 160, 89, 0.05) 100%);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(197, 160, 89, 0.1);
}

.net-worth-label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.net-worth-value {
  font-size: 42px;
  font-weight: 700;
  color: var(--color-gold);
  font-family: var(--font-serif);
  margin-bottom: 14px;
  transition: filter var(--transition-base);
}

.portfolio-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border: 2px solid;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.liquidity-ratio {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.liquidity-ratio strong {
  color: var(--color-gold);
  font-weight: 700;
}

/* ============================================================================
   ACCOUNTS SECTION
   ============================================================================ */

.accounts-section {
  padding: 20px;
}

.section-title {
  font-size: 14px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 2px;
  margin-bottom: 14px;
  font-weight: 600;
}

.accounts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .accounts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.account-card {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  transition: all var(--transition-base);
  cursor: pointer;
}

.account-card:hover {
  background: rgba(197, 160, 89, 0.08);
  border-color: var(--color-gold);
  transform: translateY(-2px);
}

.account-card:active {
  transform: scale(0.95);
}

.account-name {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.account-balance {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-serif);
  margin-bottom: 10px;
  transition: all var(--transition-base);
}

.managed-badge {
  display: inline-block;
  font-size: 10px;
  background: rgba(139, 92, 246, 0.2);
  color: var(--color-purple);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* ============================================================================
   SEARCH & FILTERS
   ============================================================================ */

.search-section {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 12px var(--color-gold-glow);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  flex: 1;
  padding: 10px 14px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
}

.filter-btn.active {
  background: var(--color-gold);
  color: var(--color-oled-black);
  border-color: var(--color-gold);
}

.filter-btn:hover {
  border-color: var(--color-gold);
}

/* ============================================================================
   ADD TRANSACTION PANEL
   ============================================================================ */

.add-transaction-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-slate);
  border-top: 1px solid var(--color-border);
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 40px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 200;
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-gold);
}

.close-btn {
  width: 32px;
  height: 32px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 16px;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-gold);
  color: var(--color-oled-black);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
  box-shadow: 0 0 12px var(--color-gold-glow);
}

.form-toggle {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  background: var(--color-slate-light);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.toggle-btn.active {
  background: var(--color-gold);
  color: var(--color-oled-black);
  border-color: var(--color-gold);
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin-bottom: 8px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-gold);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 0 12px var(--color-gold-glow);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.2);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-gold);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  box-shadow: 0 0 12px var(--color-gold-glow);
}

.slider::-moz-range-thumb:active {
  transform: scale(1.2);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ============================================================================
   TRANSACTIONS SECTION
   ============================================================================ */

.transactions-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-add-transaction {
  padding: 8px 14px;
  background: var(--color-gold);
  color: var(--color-oled-black);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-add-transaction:hover {
  background: var(--color-gold-dark);
}

.btn-add-transaction:active {
  transform: scale(0.95);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.transaction-item {
  background: rgba(31, 41, 55, 0.3);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all var(--transition-base);
}

.transaction-item:hover {
  border-color: var(--color-gold);
  background: rgba(197, 160, 89, 0.05);
}

.transaction-content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.transaction-content:active {
  transform: scale(0.98);
}

.transaction-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.transaction-details {
  flex: 1;
  text-align: left;
}

.transaction-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.transaction-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.transaction-amount {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.transaction-expand {
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--color-border);
  padding: 16px 14px;
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.expand-content {
  margin-bottom: 14px;
}

.expand-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
}

.expand-label {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.expand-value {
  color: var(--color-gold);
  font-family: var(--font-serif);
  font-weight: 700;
}

.btn-slide-confirm {
  width: 100%;
  padding: 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  color: var(--color-danger);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-slide-confirm:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-slide-confirm:active {
  transform: scale(0.95);
}

.slide-to-confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.confirm-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.confirm-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-danger);
  cursor: pointer;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

.confirm-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-danger);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

.confirm-label {
  font-size: 11px;
  color: var(--color-danger);
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-confirm-delete {
  padding: 10px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-confirm-delete:hover {
  background: #dc2626;
}

.btn-confirm-delete:active {
  transform: scale(0.95);
}

/* ============================================================================
   BUTTONS
   ============================================================================ */

.btn-primary {
  width: 100%;
  padding: 14px;
  background: var(--color-gold);
  color: var(--color-oled-black);
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary:hover {
  background: var(--color-gold-dark);
  box-shadow: 0 0 20px var(--color-gold-glow);
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  background: var(--color-slate-light);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: 10px;
}

.btn-secondary:hover {
  border-color: var(--color-gold);
  background: rgba(197, 160, 89, 0.1);
}

.btn-secondary:active {
  transform: scale(0.95);
}

.btn-secondary.danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.btn-secondary.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ============================================================================
   SETTINGS SECTION
   ============================================================================ */

.settings-section {
  padding: 20px;
}

/* ============================================================================
   FOOTER
   ============================================================================ */

.app-footer {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 11px;
  border-top: 1px solid var(--color-border);
  margin-top: 20px;
}

.app-footer p {
  margin-bottom: 4px;
}

/* ============================================================================
   RESPONSIVE DESIGN
   ============================================================================ */

@media (max-width: 480px) {
  .app-container {
    padding-bottom: 80px;
  }

  .net-worth-value {
    font-size: 32px;
  }

  .account-balance {
    font-size: 18px;
  }

  .pin-vault {
    padding: 30px 20px;
  }
}

/* ============================================================================
   PWA SAFE AREA INSETS (for notched devices)
   ============================================================================ */

@supports (padding: max(0px)) {
  .app-header {
    padding-top: max(16px, env(safe-area-inset-top));
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
  }

  .app-container {
    padding-bottom: max(60px, env(safe-area-inset-bottom));
  }
}

/* ============================================================================
   PRINT STYLES
   ============================================================================ */

@media print {
  .app-header,
  .privacy-toggle,
  .btn-add-transaction,
  .filter-buttons,
  .search-input,
  .settings-section {
    display: none;
  }
}
