import { partnerRooms } from "@/data/partnerPortal";

export function PartnerRoomsView() {
  return (
    <section className="partnerPortalRoomGrid" aria-label="Partner rooms">
      {partnerRooms.map((room) => (
        <article className="partnerPortalPanel partnerPortalRoomCard" key={room.id}>
          <div className="partnerPortalRoomMedia" style={{ backgroundImage: `url('${room.photos[0]}')` }} />
          <div>
            <div className="partnerPortalSectionHeader">
              <p className="eyebrow">{room.availability}</p>
              <h2>{room.name}</h2>
            </div>
            <div className="partnerPortalSnapshotGrid">
              <div>
                <span>Price</span>
                <strong>{room.price}</strong>
                <small>{room.seasonalPrice}</small>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{room.capacity}</strong>
                <small>{room.discount}</small>
              </div>
            </div>
            <div className="partnerPortalPills">
              {room.amenities.map((amenity) => (
                <span key={amenity}>{amenity}</span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
