export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body is required'
      });
    }

    // Add your validation logic here
    const { content, boxId } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content must be a non-empty string'
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content exceeds maximum length of 10000 characters'
      });
    }

    if (!boxId || typeof boxId !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Box ID must be a non-empty string'
      });
    }

    // Here you would typically save the data to a database
    // For now, we'll just log it to the console
    console.log('Save request received:', { boxId, contentLength: content.length });

    return res.status(200).json({
      success: true,
      message: 'Data received successfully',
      boxId
    });

  } catch (error) {
    console.error('Error in save endpoint:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request'
    });
  }
}