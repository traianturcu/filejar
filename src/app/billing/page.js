import SegmentTrack from "@/components/SegmentTrack";

const BillingPage = () => {
  return (
    <div>
      <h1>Billing Page</h1>
      <SegmentTrack
        eventName="Visit Page"
        properties={{
          page: "Billing",
        }}
      />
    </div>
  );
};

export default BillingPage;
