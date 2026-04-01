export async function createBitrixLead(user: { email: string; name?: string | null }) {
  const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("No BITRIX24_WEBHOOK_URL configured, skipping Bitrix24 lead creation.");
    return;
  }

  // Ensure webhookUrl ends with trailing slash
  const baseUrl = webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`;
  const url = `${baseUrl}crm.lead.add.json`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          TITLE: `Новый пользователь: ${user.email}`,
          NAME: user.name || "Пользователь приложения",
          EMAIL: [{ VALUE: user.email, VALUE_TYPE: "WORK" }],
          SOURCE_ID: "WEB",
          SOURCE_DESCRIPTION: "Сайт pevzner.pro",
        },
      }),
    });

    if (!response.ok) {
      console.error(`Failed to create Bitrix24 lead: ${response.statusText}`);
      const errorText = await response.text();
      console.error("Bitrix24 Error:", errorText);
      return null;
    }

    const data = await response.json();
    console.log(`Successfully created Bitrix24 lead. Result ID: ${data.result}`);
    return data.result;
  } catch (error) {
    console.error("Error creating Bitrix24 lead:", error);
    return null;
  }
}
