import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetProductsQuery, useGetCategoriesQuery } from '../../services/api';
import { addToCart } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const FALLBACK_ICONS = ['🫙', '🍶', '📦', '🥤', '💧', '🧊', '🫧', '🚰'];
const CARD_GRADIENTS = [
  'from-cyan-50 to-teal-50',
  'from-violet-50 to-purple-50',
  'from-amber-50 to-orange-50',
  'from-blue-50 to-sky-50',
  'from-rose-50 to-pink-50',
  'from-emerald-50 to-green-50',
];

const BADGES = ['Best Seller', 'Compact', 'Office Fav', 'Pack of 12', 'Popular', 'New'];

function Stars({ rating = 4.8 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-bold text-slate-500">{rating}</span>
    </div>
  );
}

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('popular');
  const [showJarOnly, setShowJarOnly] = useState(false);
  const [qty, setQty] = useState({});

  const { data, isLoading, isError } = useGetProductsQuery({
    search,
    category,
    isAvailable: true,
  });
  const { data: cats } = useGetCategoriesQuery();

  const products = useMemo(() => {
    let list = [...(data?.products || [])];

    if (showJarOnly) {
      list = list.filter((p) => p.isJarProduct);
    }

    if (sort === 'low') {
      list.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0));
    }

    if (sort === 'high') {
      list.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0));
    }

    return list;
  }, [data, showJarOnly, sort]);

  const handleAdd = (product) => {
    if (!isAuth) {
      toast.error('Please login to add products to cart');
      navigate('/login');
      return;
    }

    const quantity = qty[product._id] || 1;

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        quantity,
        unit: product.unit,
        isJarProduct: product.isJarProduct,
        depositAmount: product.depositAmount,
      })
    );

    toast.success(`${product.name} ×${quantity} added to cart`);
  };

  const updateQty = (id, value) => {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(1, value),
    }));
  };

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-cyan-50">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="page-container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="section-eyebrow">AquaFlow Catalog</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
              All Water Products
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 md:text-xl">
              Browse RO jars, bottles, cartons, and event supply products with clear pricing,
              stock availability, and deposit visibility.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="page-container py-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                className="input h-14 rounded-2xl pl-12"
                placeholder="Search water products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input h-14 rounded-2xl"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {cats?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="input h-14 rounded-2xl"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Popular</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowJarOnly((v) => !v)}
              className={`h-14 rounded-2xl px-5 text-sm font-black transition ${
                showJarOnly
                  ? 'bg-blue-700 text-white shadow-lg shadow-blue-200'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              Jar Products
            </button>
          </div>

          {!isAuth && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              Guests can view products. Please login to add items to cart or checkout.
            </div>
          )}
        </div>
      </section>

      <section className="page-container py-10 md:py-14">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">
              Showing <span className="text-slate-950">{products.length}</span> products
            </p>
            <p className="mt-1 text-sm text-slate-500">Transparent price, deposit, and stock details.</p>
          </div>

          <Link
            to="/service-area"
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700"
          >
            Check Delivery Area →
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-56 animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-xl font-black text-red-700">Could not load products</p>
            <p className="mt-2 text-sm font-semibold text-red-600">Please check backend connection.</p>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
              🔍
            </div>
            <p className="text-2xl font-black text-slate-950">No products found</p>
            <p className="mt-2 text-slate-500">Try changing search, category, or filters.</p>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const finalPrice = product.salePrice || product.price;
              const quantity = qty[product._id] || 1;
              const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
              const icon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
              const badge = product.isJarProduct ? 'Jar Deposit' : BADGES[index % BADGES.length];
              const stock = Number(product.stock || 0);

              return (
                <article
                  key={product._id}
                  className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-100"
                >
                  <div className={`relative flex h-56 items-center justify-center bg-gradient-to-br ${gradient}`}>
                    <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-800 shadow-sm">
                      {badge}
                    </div>

                    {stock > 0 && stock < 10 && (
                      <div className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black text-white shadow-sm">
                        Only {stock} left
                      </div>
                    )}

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="relative z-10 h-32 max-w-[70%] object-contain transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="relative z-10 text-7xl transition duration-300 group-hover:scale-110">
                        {icon}
                      </div>
                    )}

                    <div className="absolute -bottom-10 right-5 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 text-lg font-black leading-tight text-slate-950">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{product.unit}</p>
                      </div>

                      <Stars rating={(4.6 + (index % 4) * 0.1).toFixed(1)} />
                    </div>

                    <p className="min-h-12 text-sm leading-6 text-slate-600 line-clamp-2">
                      {product.description ||
                        'RO purified water product for home, office, travel, or event needs.'}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                          Price
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-black text-slate-950">₹{finalPrice}</p>
                          {product.salePrice && (
                            <p className="pb-1 text-sm font-bold text-slate-400 line-through">
                              ₹{product.price}
                            </p>
                          )}
                        </div>
                      </div>

                      {product.isJarProduct && (
                        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
                          <p className="text-[10px] font-black uppercase text-amber-600">Deposit</p>
                          <p className="text-sm font-black text-amber-700">
                            ₹{product.depositAmount || 150}
                          </p>
                        </div>
                      )}
                    </div>

                    {stock <= 0 ? (
                      <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-black text-slate-500">
                        Out of Stock
                      </div>
                    ) : (
                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <button
                            onClick={() => updateQty(product._id, quantity - 1)}
                            className="flex h-12 w-10 items-center justify-center text-lg font-black text-slate-500 hover:bg-white hover:text-slate-950"
                          >
                            −
                          </button>

                          <span className="flex h-12 w-10 items-center justify-center text-sm font-black text-slate-950">
                            {quantity}
                          </span>

                          <button
                            onClick={() => updateQty(product._id, quantity + 1)}
                            className="flex h-12 w-10 items-center justify-center text-lg font-black text-slate-500 hover:bg-white hover:text-slate-950"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleAdd(product)}
                          className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-blue-700 px-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-800"
                        >
                          {isAuth ? 'Add to Cart' : 'Login to Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
