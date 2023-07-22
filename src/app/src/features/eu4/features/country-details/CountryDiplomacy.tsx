import { formatInt } from "@/lib/format";
import { useCallback, useMemo } from "react";
import { TagFlag } from "../../components/avatars";
import { CountryDetails, DiplomacyEntry } from "../../types/models";
import { isOfType } from "@/lib/isPresent";

const isColony = (subjectType: string) => {
  switch (subjectType) {
    case "colony":
    case "private_enterprise":
    case "self_governing_colony":
    case "crown_colony":
      return true;
    default:
      return false;
  }
};

const RelationshipSince = ({
  x,
}: {
  x: { tag: string; name: string; start_date: string | undefined };
}) => {
  return (
    <div>
      <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
      {x.start_date && <p className="m-0 text-sm">Since: {x.start_date}</p>}
    </div>
  );
};

export const DiploRow = <T,>({
  title,
  relations,
  children,
}: {
  title: string;
  relations: ({ tag: string; name: string } & T)[];
  children: (arg: T) => React.ReactNode;
}) => {
  const rowClass = `grid w-full grid-cols-[repeat(auto-fill,_minmax(204px,_1fr))]`;

  if (relations.length == 0) {
    return null;
  }

  return (
    <tr className="even:bg-gray-50">
      <td className="py-4 align-baseline">{title}:</td>
      <td className="w-full px-2 py-4">
        <div className={rowClass}>
          {relations.map((x) => (
            <TagFlag key={x.tag} tag={x.tag} size="large">
              {children(x)}
            </TagFlag>
          ))}
        </div>
      </td>
    </tr>
  );
};

export const CountryDiplomacy = ({ details }: { details: CountryDetails }) => {
  const dip = useMemo(
    () => details.diplomacy.map(({ data, ...rest }) => ({ ...rest, ...data })),
    [details.diplomacy]
  );

  const notMe = useCallback(
    (x: Pick<DiplomacyEntry, "first" | "second">) =>
      x.first.tag === details.tag ? x.second : x.first,
    [details.tag]
  );

  const juniorPartners = useMemo(
    () =>
      dip.filter(isOfType("JuniorPartner")).map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe]
  );

  const vassals = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.first.tag === details.tag &&
            x.subject_type === "vassal"
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const overlord = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.second.tag === details.tag &&
            (x.subject_type === "vassal" ||
              x.subject_type == "personal_union" ||
              x.subject_type == "core_eyalet" ||
              x.subject_type == "eyalet" ||
              x.subject_type == "appanage" ||
              x.subject_type == "tributary_state" ||
              isColony(x.subject_type))
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const coreEyalets = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.first.tag === details.tag &&
            x.subject_type === "core_eyalet"
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const eyalets = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.first.tag === details.tag &&
            x.subject_type === "eyalet"
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const appanages = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.first.tag === details.tag &&
            x.subject_type === "appanage"
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const tributaries = useMemo(
    () =>
      dip
        .filter(
          (x) =>
            x.kind === "Dependency" &&
            x.first.tag === details.tag &&
            x.subject_type === "tributary_state"
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const colonies = useMemo(
    () =>
      dip
        .filter(isOfType("Dependency"))
        .filter((x) => x.first.tag === details.tag && isColony(x.subject_type))
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const allies = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "Alliance")
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe]
  );

  const marriages = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "RoyalMarriage")
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe]
  );

  const warned = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "Warning" && x.first.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const warnedBy = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "Warning" && x.second.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const subsidizing = useMemo(
    () =>
      dip
        .filter(isOfType("Subsidy"))
        .filter((x) => x.first.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const subsidized = useMemo(
    () =>
      dip
        .filter(isOfType("Subsidy"))
        .filter((x) => x.second.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const reparationsReceiving = useMemo(
    () =>
      dip
        .filter(isOfType("Reparations"))
        .filter((x) => x.second.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const reparationsGiving = useMemo(
    () =>
      dip
        .filter(isOfType("Reparations"))
        .filter((x) => x.first.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const tradePowerReceiving = useMemo(
    () =>
      dip
        .filter(
          (x) => x.kind === "TransferTrade" && x.second.tag === details.tag
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const tradePowerGiving = useMemo(
    () =>
      dip
        .filter(
          (x) => x.kind === "TransferTrade" && x.first.tag === details.tag
        )
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const steerTradeReceiving = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "SteerTrade" && x.second.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  const steerTradeGiving = useMemo(
    () =>
      dip
        .filter((x) => x.kind === "SteerTrade" && x.first.tag === details.tag)
        .map((x) => ({ ...x, ...notMe(x) })),
    [dip, notMe, details.tag]
  );

  return (
    <table className="w-full border-collapse">
      <tbody>
        <DiploRow title="Allies" relations={allies}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Royal Marriages" relations={marriages}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Overlord" relations={overlord}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Vassals" relations={vassals}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Appanage" relations={appanages}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Core Eyalets" relations={coreEyalets}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Eyalets" relations={eyalets}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Tributaries" relations={tributaries}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Colonies" relations={colonies}>
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              <p className="m-0 text-sm">
                {x.subject_type.replace("_colony", "")}
              </p>
              {x.start_date && (
                <p className="m-0 text-sm">Since: {x.start_date}</p>
              )}
            </div>
          )}
        </DiploRow>

        <DiploRow title="Junior Partners" relations={juniorPartners}>
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              <p className="m-0 text-sm">
                Inheritance Value: {x.pu_inheritance_value}
              </p>
              {x.start_date && (
                <p className="m-0 text-sm">Since: {x.start_date}</p>
              )}
            </div>
          )}
        </DiploRow>

        <DiploRow title="Warning" relations={warned}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Warned by" relations={warnedBy}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Subsidizing" relations={subsidizing}>
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              <p className="m-0 text-sm">
                Monthly amount: {formatInt(x.amount)}
              </p>
              {x.start_date && (
                <p className="m-0 text-sm">{`Since ${x.start_date}${
                  x.total !== undefined && `: ${formatInt(x.total)}`
                }`}</p>
              )}
            </div>
          )}
        </DiploRow>

        <DiploRow title="Subsidized by" relations={subsidized}>
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              <p className="m-0 text-sm">Monthly amount: {x.amount}</p>
              {x.start_date && (
                <p className="m-0 text-sm">{`Since ${x.start_date}${
                  x.total !== undefined && `: ${formatInt(x.total)}`
                }`}</p>
              )}
            </div>
          )}
        </DiploRow>

        <DiploRow
          title="Reparations (receiving)"
          relations={reparationsReceiving}
        >
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              {x.start_date && (
                <p className="m-0 text-sm">Since: {x.start_date}</p>
              )}
              {x.end_date && <p className="m-0 text-sm">End: {x.end_date}</p>}
            </div>
          )}
        </DiploRow>

        <DiploRow title="Reparations (giving)" relations={reparationsGiving}>
          {(x) => (
            <div>
              <p className="m-0 text-sm">{`${x.name} (${x.tag})`}</p>
              {x.start_date && (
                <p className="m-0 text-sm">Since: {x.start_date}</p>
              )}
              {x.end_date && <p className="m-0 text-sm">End: {x.end_date}</p>}
            </div>
          )}
        </DiploRow>

        <DiploRow
          title="Trade Power (receiving)"
          relations={tradePowerReceiving}
        >
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Trade Power (giving)" relations={tradePowerGiving}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow
          title="Steer Trade (receiving)"
          relations={steerTradeReceiving}
        >
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>

        <DiploRow title="Steer Trade (giving)" relations={steerTradeGiving}>
          {(x) => <RelationshipSince x={x} />}
        </DiploRow>
      </tbody>
    </table>
  );
};
