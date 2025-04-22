// src/components/pagos/PagoForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from '../layout/Navbar';
import { axiosInstance } from '../../context/AuthContext';
import './Pagos.css';

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY);


console.log("🔑 Stripe Key:", process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ ofertaId, postulacionId, musicianName, amount, isAuthenticated, currentUser }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const res = await axiosInstance.post('/pagos/create-payment-intent', {
          ofertaId,
          postulacionId,
          amount: amount * 100 // en céntimos
        });
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error(err);
        setError('Error al inicializar el pago.');
      }
    };
    createPaymentIntent();
  }, [ofertaId, postulacionId, amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (payload.error) {
      setError(`Error de pago: ${payload.error.message}`);
      setProcessing(false);
    } else {
      try {
        await axiosInstance.post('/pagos/confirm-payment', {
          ofertaId,
          postulacionId
        });
        setError(null);
        setSucceeded(true);
        setProcessing(false);
        setTimeout(() => navigate('/mis-ofertas'), 2000);
      } catch (err) {
        setError('Error al confirmar el pago en el servidor');
        setProcessing(false);
      }
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>Realizar pago a {musicianName}</h3>
      <p className="payment-amount">Cantidad: {amount.toFixed(2)}€</p>
      <div className="payment-card-container">
        <CardElement options={cardStyle} />
      </div>
      {error && <div className="payment-error">{error}</div>}
      {succeeded && <div className="payment-success">¡Pago completado con éxito!</div>}
      <button disabled={processing || !stripe || succeeded} className="payment-button">
        {processing ? 'Procesando...' : 'Pagar ahora'}
      </button>
    </form>
  );
};

const PagoForm = () => {
  const { id: ofertaId, postulacionId } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [oferta, setOferta] = useState(null);
  const [postulacion, setPostulacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(50);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentUser?.role !== 'organizer') {
      navigate('/ofertas');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/ofertas/${ofertaId}`);
        setOferta(res.data);
        const post = res.data.postulaciones.find(p => p._id === postulacionId);
        if (post) {
          setPostulacion(post);
          if (post.musician?.profile?.tarifa?.monto) {
            setAmount(post.musician.profile.tarifa.monto);
          }
        } else {
          setError('Postulación no encontrada');
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser, navigate, ofertaId, postulacionId]);

  const handleAmountChange = (e) => {
    setAmount(parseFloat(e.target.value));
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Cargando información de pago...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!oferta || !postulacion) {
    return (
      <div>
        <Navbar />
        <div className="error-message">No se encontró la información necesaria</div>
      </div>
    );
  }

  const musicianName = postulacion.musician?.name || 'Músico';

  return (
    <div className="pago-container">
      <Navbar />
      <div className="pago-wrapper">
        <div className="pago-header">
          <h1>Contratación de Músico</h1>
          <h2>{oferta.titulo}</h2>
        </div>
        <div className="pago-info">
          <p><strong>Músico:</strong> {musicianName}</p>
          <p><strong>Fecha del evento:</strong> {new Date(oferta.fechaEvento).toLocaleDateString()}</p>
          <div className="amount-input">
            <label htmlFor="amount">Cantidad a pagar (€):</label>
            <input
              type="number"
              id="amount"
              min="10"
              step="10"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
        </div>
        <div className="stripe-container">
          <Elements stripe={stripePromise}>
            <CheckoutForm
              ofertaId={ofertaId}
              postulacionId={postulacionId}
              musicianName={musicianName}
              amount={amount}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PagoForm;
