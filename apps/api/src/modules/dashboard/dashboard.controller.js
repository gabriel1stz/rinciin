import { getDashboard } from "./dashboard.service.js";

export async function dashboardController(req, res) {
  try {

    const dashboard = await getDashboard(req.user.id);

    res.json({
      success: true,
      data: dashboard
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success:false,
      message:"Internal Server Error"
    });

  }
}