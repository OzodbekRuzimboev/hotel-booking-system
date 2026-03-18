using HotelBookingSystem.Api.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace HotelBookingSystem.Api.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (AppException ex)
            {
                _logger.LogWarning(ex, 
                    "Application exception. StatusCode={StatusCode}, Path={Path}, TraceId={TraceId}",
                    ex.StatusCode,
                    context.Request.Path,
                    context.TraceIdentifier);

                await WriteProblemDetailsAsync(
                    context,
                    ex.StatusCode,
                    GetTitle(ex.StatusCode),
                    ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Unhandled exception. Path={Path}, TraceId={TraceId}",
                    context.Request.Path,
                    context.TraceIdentifier);

                var detail = _environment.IsDevelopment()
                    ? ex.Message
                    : "An unexpected error occurred.";

                await WriteProblemDetailsAsync(
                    context,
                    StatusCodes.Status500InternalServerError,
                    "Internal Server Error",
                    detail);
            }
        }

        private async Task WriteProblemDetailsAsync(
            HttpContext context,
            int statusCode,
            string title,
            string detail)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogWarning(
                    "Cannot write problem details because the response has already started. Path={Path}, TraceId={TraceId}",
                    context.Request.Path,
                    context.TraceIdentifier);

                return;
            }

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = context.Request.Path
            };

            problem.Extensions["traceId"] = context.TraceIdentifier;

            await context.Response.WriteAsJsonAsync(problem);
        }

        private static string GetTitle(int statusCode) =>
            ReasonPhrases.GetReasonPhrase(statusCode) is { Length: > 0 } reason ? reason : "Error";
    }
}
