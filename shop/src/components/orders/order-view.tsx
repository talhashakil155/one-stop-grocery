import dayjs from 'dayjs';
import Link from '@/components/ui/link';
import usePrice from '@/lib/use-price';
import { formatAddress } from '@/lib/format-address';
import { formatString } from '@/lib/format-string';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { useCart } from '@/store/quick-cart/cart.context';
import { CheckMark } from '@/components/icons/checkmark';
import { OrderItems } from '@/components/orders/order-items';
import { useAtom } from 'jotai';
import { clearCheckoutAtom } from '@/store/checkout';
import SuborderItems from '@/components/orders/suborder-items';
import isEmpty from 'lodash/isEmpty';
import { OrderStatus, PaymentStatus, RefundStatus } from '@/types';
import { HomeIconNew } from '@/components/icons/home-icon-new';
import OrderViewHeader from './order-view-header';
import OrderStatusProgressBox from '@/components/orders/order-status-progress-box';
import { Product } from '@/types';
import { useCallback, useEffect, useState } from 'react';

function OrderView({ order, language, settings, loadingStatus }: any) {
  const { t } = useTranslation('common');
  const { resetCart } = useCart();
  const [, resetCheckout] = useAtom(clearCheckoutAtom);

  useEffect(() => {
    resetCart();
    //@ts-ignore
    resetCheckout();
  }, [resetCart, resetCheckout]);

  // const { price: total } = usePrice({ amount: order?.paid_total! });
  const { price: wallet_total } = usePrice({
    amount: order?.wallet_point?.amount! ?? 0,
  });
  // const { price: sub_total } = usePrice({ amount: order?.amount! });
  // const { price: shipping_charge } = usePrice({
  //   amount: order?.delivery_fee ?? 0,
  // });
  // const { price: tax } = usePrice({ amount: order?.sales_tax ?? 0 });
  // const { price: discount } = usePrice({ amount: order?.discount ?? 0 });

  const amountPayable: number =
    order?.payment_status !== PaymentStatus.SUCCESS
      ? order?.paid_total! - order?.wallet_point?.amount!
      : 0;

  const { price: amountDue } = usePrice({ amount: amountPayable });



  const [cartLength, setCartLength] = useState(0)
  const [tempsubtotal1, setTempSubTotal1] = useState(0)

  const [tempsubtotal, setTempSubTotal] = useState("")
  const [tempTotal, setTotal] = useState("")


  const { price: shipping_charge } = usePrice({ amount: 12 });
  const { price: tax } = usePrice({ amount: 0.29 });
  const { price: discount } = usePrice({ amount: 0 });


  const { price: subtotal } = usePrice({ amount: Number(tempsubtotal1) });
  const { price: total } = usePrice({ amount: Number(tempsubtotal1) + 12 + 0.29 });


  const loadCartFromFile = useCallback(async () => {
    console.log("inside loadCartFromFile")

    const response = await fetch('/api/cart/load-cart');
    const cartItems = await response.json();
    setCartLength(cartItems.length)

    const calculatedSubtotal = await cartItems.reduce((sum: number, cartItem: any) => {
      return sum + (cartItem.quantity * cartItem.price);
    }, 0);

    setTempSubTotal1(calculatedSubtotal);
    return {};
  }, []);


  useEffect(() => {
    const loadData = async () => {
      await loadCartFromFile();
  
    };
  
    loadData();
    setTempSubTotal(subtotal);
    setTotal(total);
  }, [loadCartFromFile, subtotal, total]);




  return (
    <div className="p-4 sm:p-8">
      <div className="mx-auto w-full max-w-screen-lg">
        <div className="mb-5">
          <Link
            href={Routes.home}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
          >
            <HomeIconNew />
            {t('text-back-to-home')}
          </Link>
        </div>
        <div className="relative overflow-hidden rounded border shadow-sm">
          <OrderViewHeader
            order={order}
            buttonSize="small"
            loading={loadingStatus}
          />
          <div className="bg-light p-6 sm:p-8 lg:p-12">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 md:mb-12 lg:grid-cols-4">
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-order-number')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.tracking_number}
                </p>
              </div>
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-date')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.created_at
                    ? dayjs(order?.created_at).format('MMMM D, YYYY')
                    : dayjs(new Date()).format('MMMM D, YYYY')}
                </p>
              </div>
              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-total')}
                </h3>
                <p className="text-sm text-body-dark">{tempTotal}</p>
              </div>

              <div className="rounded border border-border-200 px-5 py-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-heading">
                  {t('text-payment-method')}
                </h3>
                <p className="text-sm text-body-dark">
                  {order?.payment_gateway ?? 'N/A'}
                </p>
              </div>
            </div>
            {/* end of order received  */}

            {/* start of order Status */}
            <div className="mb-8 flex w-full items-center justify-center md:mb-12">
              <OrderStatusProgressBox
                orderStatus={order?.order_status as OrderStatus}
                paymentStatus={order?.payment_status as PaymentStatus}
              />
            </div>
            {/* end of order Status */}

            <div className="flex flex-col lg:flex-row">
              <div className="mb-12 w-full lg:mb-0 lg:w-1/2 ltr:lg:pr-3 rtl:lg:pl-3">
                <h2 className="mb-6 text-xl font-bold text-heading">
                  {t('text-total-amount')}
                </h2>
                <div>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-sub-total')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {tempsubtotal}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-shipping-charge')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {shipping_charge}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-tax')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {tax}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-discount')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12 ">
                      {discount}
                    </span>
                  </p>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                      {t('text-total')} :
                    </strong>
                    <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                      {tempTotal}
                    </span>
                  </p>
                  {order?.wallet_point?.amount! && (
                    <>
                      <p className="mt-5 flex text-body-dark">
                        <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                          {t('text-paid-from-wallet')} :
                        </strong>
                        <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                          {wallet_total}
                        </span>
                      </p>

                      <p className="mt-5 flex text-body-dark">
                        <strong className="w-5/12 text-sm font-semibold text-heading sm:w-4/12">
                          {t('text-amount-due')} :
                        </strong>
                        <span className="w-7/12 text-sm ltr:pl-4 rtl:pr-4 sm:w-8/12">
                          {amountDue}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              {/* end of total amount */}

              <div className="w-full lg:w-1/2 ltr:lg:pl-3 rtl:lg:pr-3">
                <h2 className="mb-6 text-xl font-bold text-heading">
                  {t('text-order-details')}
                </h2>
                <div>
                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-4/12 text-sm font-semibold text-heading">
                      {t('text-name')} :
                    </strong>
                    <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                      {order?.customer_name}
                    </span>
                  </p>

                  <p className="mt-5 flex text-body-dark">
                    <strong className="w-4/12 text-sm font-semibold text-heading">
                      {t('text-total-item')} :
                    </strong>
                    <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                      {formatString(cartLength, t('text-item'))}
                    </span>
                  </p>
                  {!isEmpty(order?.delivery_time) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-deliver-time')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                        {order?.delivery_time}
                      </span>
                    </p>
                  )}
                  {!isEmpty(order?.shipping_address) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-shipping-address')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4 ">
                        {formatAddress(order?.shipping_address!)}
                      </span>
                    </p>
                  )}
                  {!isEmpty(order?.billing_address) && (
                    <p className="mt-5 flex text-body-dark">
                      <strong className="w-4/12 text-sm font-semibold text-heading">
                        {t('text-billing-address')} :
                      </strong>
                      <span className="w-8/12 text-sm ltr:pl-4 rtl:pr-4">
                        {formatAddress(order?.billing_address!)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              {/* end of order details */}
            </div>
            <div className="mt-12">
              <OrderItems
                products={order?.products}
                orderId={order?.id}
                orderStatus={order?.order_status}
                refund={Boolean(
                  order?.refund?.status ===
                    RefundStatus?.APPROVED?.toLowerCase(),
                )}
                settings={settings}
              />
            </div>
            {order?.children?.length > 1 ? (
              <div>
                <h2 className="mt-12 mb-6 text-xl font-bold text-heading">
                  {t('text-sub-orders')}
                </h2>
                <div>
                  <div className="mb-12 flex items-start rounded border border-gray-700 p-4">
                    <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-dark px-2 ltr:mr-3 rtl:ml-3">
                      <CheckMark className="h-2 w-2 shrink-0 text-light" />
                    </span>
                    <p className="text-sm text-heading">
                      <span className="font-bold">{t('text-note')}:</span>{' '}
                      {t('message-sub-order')}
                    </p>
                  </div>
                  {Array.isArray(order?.children) && order?.children.length && (
                    <div className="">
                      <SuborderItems
                        items={order?.children}
                        orderStatus={order?.order_status}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {order?.note ? (
              <>
                <h2 className="mt-12 mb-5 text-xl font-bold text-heading">
                  {t('common:text-purchase-note')}
                </h2>
                <div className="mb-12 flex items-start rounded border border-gray-700 bg-gray-100 p-4">
                  <p className="text-sm text-heading">{order?.note}</p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  order: any;
  settings: any;
  loadingStatus?: boolean;
}

const Order: React.FC<Props> = ({ order, settings, loadingStatus }) => {
  return (
    <OrderView
      order={order}
      language={order?.language}
      loadingStatus={loadingStatus}
      settings={settings}
    />
  );
};

export default Order;
