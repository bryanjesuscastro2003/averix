import { DeliveryData } from "../../../../../types/data/IDelivery";
import { DeliveryAdvanceDetailsRequestCard } from "./DeliveryAdvanceDetailsRequestCard";

export const DeliveryAdvanceDetailsPage: React.FC<{ data: DeliveryData }> = ({
  data,
}) => {
  return <DeliveryAdvanceDetailsRequestCard data={data} />;
};
