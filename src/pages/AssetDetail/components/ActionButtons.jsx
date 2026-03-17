export default function ActionButtons({ onEdit, onUpdateQuantity, onDelete }) {
  return (
    <section className="asset-actions-row card">
      <button type="button" className="btn-primary" onClick={onEdit}>Edit Asset</button>
      <button type="button" className="btn-outline" onClick={onUpdateQuantity}>Update Quantity</button>
      <button type="button" className="btn-danger-outline" onClick={onDelete}>Delete Asset</button>
    </section>
  );
}
