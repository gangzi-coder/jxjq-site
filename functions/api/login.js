export async function onRequestPost(context) {
  try {
    const payload = await context.request.json();
    const password = context.env.ADMIN_PASSWORD || "jxjq456";

    if (payload.password !== password) {
      return Response.json({ message: "密码错误" }, { status: 403 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ message: "请求格式错误" }, { status: 400 });
  }
}
