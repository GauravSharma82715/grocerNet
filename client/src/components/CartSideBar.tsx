import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ArrowRightIcon, MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon, XIcon } from "lucide-react";

const CartSideBar = () => {
  const currency = import.meta.env.VITR_CUURENCY_SYMBOL || "$";
  const {
    items,
    updateQuantity,
    removeFromCart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
      />

      {/* Actual sidebar container */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right p-4">
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b pb-4 border-app-border">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />
            <h2 className="text-lg font-medium">Your Cart</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-app-cream rounded-full">
              {items.length}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl hover:bg-app-cream transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBagIcon className="size-16 text-app-border mb-4" />
              <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product._id} className="flex gap-3 bg-app-cream/60 rounded-xl p-3">
                <img src={item.product.image} alt={item.product.name} className="size-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                  <p className="text-xs text-app-text-light">{currency}{item.product.price.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        className="size-7 rounded-lg bg-white border border-app-border flex items-center justify-center"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      >
                        <MinusIcon className="size-3" />
                      </button>

                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>

                      <button
                        className="size-7 rounded-lg bg-white border border-app-border flex items-center justify-center"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      >
                        <PlusIcon className="size-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {currency}{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(item.product._id)} className="p-1 text-app-text-light hover:text-app-error transition-colors">
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-app-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-app-text-light">SubTotal</span>
              <span className="font-medium">{currency}{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-app-text-light">Delivery</span>
              <span className="font-medium">
                {deliveryFee === 0 ? <span className="text-app-success">Free</span> : `${currency}${deliveryFee.toFixed(2)}`}
              </span>
            </div>

            {deliveryFee > 0 && (
              <p className="text-xs text-app-text-light text-center">
                Free Delivery on orders above {currency}20!
              </p>
            )}

            <div className="flex justify-between text-base font-semibold border-t border-app-border pt-3 mt-1">
              <span>Total</span>
              <span>{currency}{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
                window.scrollTo(0, 0);
              }}
              className="w-full py-3 bg-app-orange text-white font-semibold rounded-xl hover:bg-app-orange-dark transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Proceed to CheckOut <ArrowRightIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSideBar;
