import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CreditCard,
  History,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus
} from "lucide-react";

import { api } from "./api.js";
import "./styles.css";

const TOKEN_KEY = "payment_portal_token";

function formatMoney(amountMinor, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency
  }).format(amountMinor / 100);
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(token && user);

  const selectedMessageClass = useMemo(() => {
    if (!message) return "message";
    return message.toLowerCase().includes("failed") || message.toLowerCase().includes("invalid")
      ? "message error"
      : "message";
  }, [message]);

  async function loadPortalData(activeToken = token) {
    if (!activeToken) return;

    const [meResult, productsResult, paymentsResult] = await Promise.all([
      api.me(activeToken),
      api.products(),
      api.myPayments(activeToken)
    ]);

    setUser(meResult.user);
    setProducts(productsResult.products);
    setPayments(paymentsResult.payments);
  }

  useEffect(() => {
    api.products()
      .then((result) => setProducts(result.products))
      .catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    if (!token) return;

    loadPortalData(token).catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    });
  }, [token]);

  function updateForm(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result =
        mode === "register"
          ? await api.register(form)
          : await api.login({ email: form.email, password: form.password });

      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      await loadPortalData(result.token);
      setMessage(mode === "register" ? "Account created." : "Logged in.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(productId) {
    setLoading(true);
    setMessage("");

    try {
      const result = await api.createCheckoutSession(token, productId);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPayments() {
    setLoading(true);
    setMessage("");

    try {
      const result = await api.myPayments(token);
      setPayments(result.payments);
      setMessage("Payment history refreshed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setPayments([]);
    setMessage("Logged out.");
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Stripe test mode portal</p>
          <h1>Payment Portal</h1>
        </div>
        {isLoggedIn ? (
          <button className="ghost-button" onClick={logout} type="button">
            <LogOut size={18} />
            Logout
          </button>
        ) : null}
      </section>

      {message ? <div className={selectedMessageClass}>{message}</div> : null}

      {!isLoggedIn ? (
        <section className="auth-grid">
          <form className="panel auth-panel" onSubmit={handleAuth}>
            <div className="tabs" aria-label="Auth mode">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
                type="button"
              >
                <KeyRound size={17} />
                Login
              </button>
              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => setMode("register")}
                type="button"
              >
                <UserPlus size={17} />
                Register
              </button>
            </div>

            {mode === "register" ? (
              <label>
                Name
                <input name="name" onChange={updateForm} value={form.name} />
              </label>
            ) : null}

            <label>
              Email
              <input name="email" onChange={updateForm} type="email" value={form.email} />
            </label>

            <label>
              Password
              <input
                name="password"
                onChange={updateForm}
                type="password"
                value={form.password}
              />
            </label>

            <button className="primary-button" disabled={loading} type="submit">
              <ShieldCheck size={18} />
              {mode === "register" ? "Create account" : "Login"}
            </button>
          </form>

          <aside className="panel plain-panel">
            <h2>How this works</h2>
            <p>
              You log in here, choose a test product, then the backend creates a Stripe
              Checkout Session. Stripe handles the card form.
            </p>
          </aside>
        </section>
      ) : (
        <section className="portal-grid">
          <div className="panel account-panel">
            <p className="eyebrow">Signed in</p>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <section className="products">
            <div className="section-title">
              <h2>Choose Payment</h2>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <strong>{formatMoney(product.amountMinor, product.currency)}</strong>
                  <button
                    className="primary-button"
                    disabled={loading}
                    onClick={() => startCheckout(product.id)}
                    type="button"
                  >
                    <CreditCard size={18} />
                    Pay with Stripe
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel history-panel">
            <div className="section-title compact">
              <h2>Payment History</h2>
              <button className="icon-button" onClick={refreshPayments} type="button" title="Refresh">
                <RefreshCw size={18} />
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="empty-state">
                <History size={24} />
                <p>No payments yet.</p>
              </div>
            ) : (
              <div className="payment-list">
                {payments.map((payment) => (
                  <article className="payment-row" key={payment.id}>
                    <div>
                      <strong>{formatMoney(payment.amountMinor, payment.currency)}</strong>
                      <span>{payment.receiptId}</span>
                    </div>
                    <span className={`status ${payment.status}`}>{payment.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
