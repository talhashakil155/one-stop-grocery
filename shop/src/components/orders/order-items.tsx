import { Table } from '@/components/ui/table';
import usePrice from '@/lib/use-price';
import { useTranslation } from 'next-i18next';
import { useIsRTL } from '@/lib/locals';
import { Image } from '@/components/ui/image';
import { productPlaceholder } from '@/lib/placeholders';
import { useModalAction } from '@/components/ui/modal/modal.context';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import {
  getReview,
  isAlreadyReviewedInThisOrder,
  reviewSystem,
} from '@/lib/get-review';
import { OrderStatus, Product } from '@/types';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';

//FIXME: need to fix this usePrice hooks issue within the table render we may check with nested property
const OrderItemList = (_: any, record: any) => {
  const { price } = usePrice({
    amount: record.pivot?.unit_price,
  });
  let name = record.name;
  if (record?.pivot?.variation_option_id) {
    const variationTitle = record?.variation_options?.find(
      (vo: any) => vo?.id === record?.pivot?.variation_option_id,
    )['title'];
    name = `${name} - ${variationTitle}`;
  }
  return (
    <div className="flex items-center">
      <div className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded">
        <Image
          src={record.image?.thumbnail ?? productPlaceholder}
          alt={name}
          className="h-full w-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw"
        />
      </div>

      <div className="flex flex-col overflow-hidden ltr:ml-4 rtl:mr-4">
        <div className="mb-1 flex space-x-1 rtl:space-x-reverse">
          <Link
            href={Routes.product(record?.slug)}
            className="inline-block overflow-hidden truncate text-sm text-body transition-colors hover:text-accent hover:underline"
            locale={record?.language}
          >
            {name}
          </Link>
          <span className="inline-block overflow-hidden truncate text-sm text-body">
            x
          </span>
          <span className="inline-block overflow-hidden truncate text-sm font-semibold text-heading">
            {record.unit}
          </span>
        </div>
        <span className="mb-1 inline-block overflow-hidden truncate text-sm font-semibold text-accent">
          {price}
        </span>
      </div>
    </div>
  );
};
export const OrderItems = ({
  products,
  orderId,
  orderStatus,
  refund,
  settings,
}: {
  products: Product;
  orderId: any;
  orderStatus: string;
  refund: boolean;
  settings: any;
}) => {
  const { t } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();
  const { openModal } = useModalAction();
  const [finalData, setFinalData] = useState<Product[] | undefined>(undefined)

  const orderTableColumns = [
    {
      title: <span className="ltr:pl-20 rtl:pr-20">{t('text-item')}</span>,
      dataIndex: '',
      key: 'items',
      align: alignLeft,
      width: 250,
      ellipsis: true,
      render: OrderItemList,
    },
    {
      title: t('text-quantity'),
      dataIndex: 'pivot',
      key: 'pivot',
      align: 'center',
      width: 100,
      render: function renderQuantity(pivot: any) {
        return <p className="text-base">{pivot.order_quantity}</p>;
      },
    },
    {
      title: t('text-price'),
      dataIndex: 'pivot',
      key: 'price',
      align: alignRight,
      width: 100,
      render: function RenderPrice(pivot: any) {
        const { price } = usePrice({
          amount: pivot?.subtotal,
        });

        return <div>{price}</div>;
      },
    },
    {
      title: '',
      dataIndex: '',
      align: alignRight,
      width: 140,
      render: function RenderReview(_: any, record: any) {
        if (refund) {
          return;
        }

        const alreadyReviewedInOrder = isAlreadyReviewedInThisOrder(
          record,
          orderId,
          settings,
        );

        function openReviewModal() {
          openModal('REVIEW_RATING', {
            product_id: record.id,
            shop_id: record.shop_id,
            order_id: orderId,
            name: record.name,
            image: record.image,
            // my_review: record?.is_digital ? getReview(record) : null,
            my_review: reviewSystem(record, settings),
            ...(record.pivot?.variation_option_id && {
              variation_option_id: record.pivot?.variation_option_id,
            }),
          });
        }

        // Button text control for digital product
        const DigitalProductReviewButtonText = () => {
          if (settings?.reviewSystem?.value === 'review_single_time') {
            return getReview(record)
              ? t('text-update-review')
              : t('text-write-review');
          }

          return !alreadyReviewedInOrder
            ? t('text-update-review')
            : t('text-write-review');
        };

        // Button text control for physical product
        const PhysicalProductReviewButtonText = () => {
          if (settings?.reviewSystem?.value === 'review_single_time') {
            return getReview(record)
              ? t('text-update-review')
              : t('text-write-review');
          }

          return alreadyReviewedInOrder
            ? t('text-already-review')
            : t('text-write-review');
        };

        if (orderStatus === OrderStatus?.COMPLETED || refund) {
          return (
            <>
              <button
                onClick={openReviewModal}
                className={classNames(
                  'cursor-pointer text-sm font-semibold text-body transition-colors hover:text-accent',
                )}
                disabled={alreadyReviewedInOrder ? true : false}
              >
                {/* {getReview(record)
                  ? t('text-update-review')
                  : t('text-write-review')} */}
                {record?.is_digital ? (
                  <DigitalProductReviewButtonText />
                ) : (
                  <PhysicalProductReviewButtonText />
                )}
              </button>
            </>
          );
        }
      },
    },
  ];

  const loadCartFromFile = useCallback(async () => {
    const response = await fetch('/api/cart/load-cart');
    const cartItems = await response.json();
    const productsFromCartFile: Product[] = await cartItems.map((cartItem: any) => ({
      id: cartItem.id,
      name: cartItem.name,
      slug: cartItem.slug,
      is_digital: cartItem.digital,
      price: cartItem.price,
      image: {
        "id": 208,
        "original": cartItem.image,
        "thumbnail": cartItem.image
      },
      shop: cartItem.shop_id,
      unit: cartItem.unit,
      quantity: cartItem.quantity,
      total_price: cartItem.itemTotal,

      description: "Chocolate is a usually sweet, brown food preparation of roasted and ground cacao seeds that is made in the form of a liquid, paste, or in a block, or used as a flavoring ingredient in other foods.",
      "type_id": 1,
      "sale_price": 3.5,
      "language": "en",
      "min_price": 5,
      "max_price": 5,
      "sku": "1518",
      "sold_quantity": 0,
      "in_stock": 1,
      "is_taxable": 0,
      "shipping_class_id": null,
      "status": "publish",
      "product_type": "simple",
      "height": null,
      "width": null,
      "length": null,
      "gallery": [],
      "deleted_at": null,
      "created_at": "2021-03-11T06:39:46.000000Z",
      "updated_at": "2023-10-06T06:19:56.000000Z",
      "author_id": null,
      "manufacturer_id": null,
      is_external: false,
      external_product_url: "",
      "external_product_button_text": "",
      "blocked_dates": [],
      "ratings": 0,
      "total_reviews": 0,
      "rating_count": [],
      "my_review": null,
      "in_wishlist": false,
      "translated_languages": ["en"],
      "pivot": {
        "order_id": 48,
        "product_id": cartItem.id,
        "order_quantity": cartItem.quantity,
        "unit_price": cartItem.unit,
        "subtotal": cartItem.itemTotal,
        "variation_option_id": null,
        "created_at": "2024-02-07T01:08:38.000000Z",
        "updated_at": "2024-02-07T01:08:38.000000Z"
      },
      "variation_options": []
    }));

    setFinalData(productsFromCartFile)
    return productsFromCartFile;
  }, []);

  useEffect(() => {
    loadCartFromFile();
  }, [loadCartFromFile]);

  return (
    <Table
      //@ts-ignore
      columns={orderTableColumns}
      //@ts-ignore
      data={finalData}
      rowKey={(record: any) =>
        record.pivot?.variation_option_id
          ? record.pivot.variation_option_id
          : record.created_at
      }
      className="orderDetailsTable w-full"
      rowClassName="!cursor-auto"
      scroll={{ x: 350, y: 500 }}
    />
  );
};
