import { addDomain, verifyCNAME, verifyDKIM, verifyReturnPath } from "@/lib/email/postmark";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const GET = async (request) => {
  try {
    const shop = request?.headers?.get("X-Shop");

    if (!shop) {
      throw new Error("Missing shop");
    }

    const { data: shopData } = await supabase.from("shop").select("*").eq("id", shop).single();

    if (!shopData) {
      return Response.json({
        error: true,
        message: "Shop not found",
      });
    }

    const sender_email = shopData?.sender_email;
    const cname = shopData?.uuid?.substring(0, 13);

    const sender = sender_email?.toLowerCase()?.replace(/\s+/g, "");
    const domain = sender?.split("@")?.[1];

    // if the domain is filejar.com or filejardelivery.com, return error
    if (domain === "filejar.com" || domain === "filejardelivery.com") {
      return Response.json({
        error: true,
        message: "Please use a domain name you own or leave the email address blank to use our default sender.",
      });
    }

    // if email is missing or invalid return an error
    if (!sender || sender === "" || !validateEmail(sender)) {
      return Response.json({
        error: true,
        message: "You must set a sender email address first.",
      });
    }

    // if domain is invalid, return error
    if (!domain || domain === "" || !domain.includes(".")) {
      return Response.json({
        error: true,
        message: "The domain name is invalid.",
      });
    }

    // get domain data from DB
    const { data: domainData } = await supabase.from("domain").select("*").eq("name", domain).single();

    if (domainData?.dkim_verified && domainData?.return_path_verified && shopData?.cname_verified) {
      // if sender_verified is false, set it to true
      if (!shopData?.sender_verified) {
        await supabase.from("shop").update({ sender_verified: true }).eq("id", shop);
      }

      // if the domain is already verified by this shop, return success
      return Response.json({
        data: [
          {
            type: "TXT",
            name: domainData?.dkim_name,
            value: domainData?.dkim_value,
            status: domainData?.dkim_verified,
          },
          {
            type: "CNAME",
            name: domainData?.return_path_name,
            value: domainData?.return_path_value,
            status: domainData?.return_path_verified,
          },
          {
            type: "CNAME",
            name: `${cname}.${domain}`,
            value: shop,
            status: shopData?.cname_verified,
          },
        ],
        success: true,
      });
    } else if (domainData?.id) {
      // if the domain is added
      // verify the DNS records
      const dkim_result = await verifyDKIM(domainData?.id);
      const return_path_result = await verifyReturnPath(domainData?.id);
      const cname_result = await verifyCNAME(`${cname}.${domain}`, shop);

      const dkim_verified = dkim_result?.DKIMVerified;
      const return_path_verified = return_path_result?.ReturnPathDomainVerified;
      const cname_verified = cname_result?.verified;

      // update verified fields in DB
      await supabase.from("domain").update({ dkim_verified, return_path_verified }).eq("id", domainData?.id);
      await supabase.from("shop").update({ cname_verified: cname_verified }).eq("id", shop);

      // if all records are verified, set sender_verified to true
      if (dkim_verified && return_path_verified && cname_verified) {
        await supabase.from("shop").update({ sender_verified: true }).eq("id", shop);
      }
      return Response.json({
        data: [
          {
            type: "TXT",
            name: domainData?.dkim_name,
            value: domainData?.dkim_value,
            status: dkim_verified,
          },
          {
            type: "CNAME",
            name: domainData?.return_path_name,
            value: domainData?.return_path_value,
            status: return_path_verified,
          },
          {
            type: "CNAME",
            name: `${cname}.${domain}`,
            value: shop,
            status: cname_verified,
          },
        ],
        success: true,
      });
    } else {
      // if the domain is not added yet, add it
      const result = await addDomain(domain);
      const dkim_name = result?.DKIMPendingHost ?? result?.DKIMHost;
      const dkim_value = result?.DKIMPendingTextValue ?? result?.DKIMTextValue;
      const return_path_name = result?.ReturnPathDomain;
      const return_path_value = result?.ReturnPathDomainCNAMEValue;
      const dkim_verified = result?.DKIMVerified;
      const return_path_verified = result?.ReturnPathDomainVerified;
      const id = result?.ID;
      const name = domain;
      const shop = dkim_verified && return_path_verified ? shop : null;

      await supabase.from("domain").insert({
        name,
        id,
        dkim_name,
        dkim_value,
        return_path_name,
        return_path_value,
        dkim_verified,
        return_path_verified,
      });

      return Response.json({
        data: [
          {
            type: "TXT",
            name: dkim_name,
            value: dkim_value,
            status: dkim_verified,
          },
          {
            type: "CNAME",
            name: return_path_name,
            value: return_path_value,
            status: return_path_verified,
          },
          {
            type: "CNAME",
            name: `${cname}.${domain}`,
            value: shop,
            status: false,
          },
        ],
        success: true,
      });
    }
  } catch (error) {
    console.error({
      error,
      message: "Error: Failed to retrieve DNS records",
    });
    return Response.json(
      {
        success: false,
        message: "Error: Failed to retrieve DNS records",
      },
      {
        status: 500,
      }
    );
  }
};
