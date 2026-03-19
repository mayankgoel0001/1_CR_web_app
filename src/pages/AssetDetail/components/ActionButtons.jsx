export default function ActionButtons({ onEdit, onUpdateQuantity, onDelete }) {
  return (
    <section className="grid gap-[10px] p-[12px] bg-white rounded-[14px] border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200 hover:shadow-md">
      <button type="button" className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#2D7A4F] text-white rounded-[6px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#256341] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(45,122,79,0.3)] w-full justify-center" onClick={onEdit}>Edit Asset</button>
      <button type="button" className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-white text-[#2D7A4F] border border-[#2D7A4F] rounded-[8px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#F0FAF5] w-full justify-center" onClick={onUpdateQuantity}>Update Quantity</button>
      <button type="button" className="inline-flex items-center gap-[8px] py-[10px] px-[20px] bg-white text-[#ef4444] border border-[#ef4444] rounded-[8px] text-[13px] font-bold transition-all duration-200 cursor-pointer hover:bg-[#fff2f2] w-full justify-center" onClick={onDelete}>Delete Asset</button>
    </section>
  );
}
