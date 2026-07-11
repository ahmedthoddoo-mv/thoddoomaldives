import { AnalyticsRepository } from "@/lib/repositories";

export function PartnerAnalyticsView() {
  const partnerAnalyticsMetrics = AnalyticsRepository.findAll();
  const partnerChartData = AnalyticsRepository.findChartData();
  const partnerTopCountries = AnalyticsRepository.findTopCountries();

  return (
    <div className="partnerPortalStack">
      <section className="partnerPortalStatsGrid">
        {partnerAnalyticsMetrics.map((metric) => (
          <article className="partnerPortalCard partnerPortalStat" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.change}</p>
          </article>
        ))}
      </section>

      <div className="partnerPortalTwoColumn">
        <section className="partnerPortalPanel">
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">Charts</p>
            <h2>Booking Requests</h2>
          </div>
          <div className="partnerPortalChart">
            {partnerChartData.map((point) => (
              <div key={point.label}>
                <span style={{ height: `${point.value}%` }} />
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="partnerPortalPanel">
          <div className="partnerPortalSectionHeader">
            <p className="eyebrow">Countries</p>
            <h2>Top Guest Markets</h2>
          </div>
          <div className="partnerPortalCountryList">
            {partnerTopCountries.map((country) => (
              <div key={country.label}>
                <span>{country.label}</span>
                <strong>{country.value}%</strong>
                <small style={{ width: `${country.value}%` }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
