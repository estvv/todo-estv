package middleware

import (
	"net/http"
	"time"

	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/middleware/stdlib"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

var (
	generalLimiter *stdlib.Middleware
	loginLimiter    *stdlib.Middleware
)

func InitRateLimiters() {
	// General rate limit: 1000 requests per minute (10 req/sec)
	generalStore := memory.NewStore()
	generalRate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  1000,
	}
	generalLimiter = stdlib.NewMiddleware(limiter.New(generalStore, generalRate, limiter.WithTrustForwardHeader(true)))

	// Login rate limit: 10 attempts per minute
	loginStore := memory.NewStore()
	loginRate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  10,
	}
	loginLimiter = stdlib.NewMiddleware(limiter.New(loginStore, loginRate, limiter.WithTrustForwardHeader(true)))
}

func RateLimit(next http.Handler) http.Handler {
	return generalLimiter.Handler(next)
}

func LoginRateLimit(next http.Handler) http.Handler {
	return loginLimiter.Handler(next)
}