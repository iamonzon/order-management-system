type ShutdownHandler = () => Promise<void> | void;

export class GracefulShutdown {
  private handlers: ShutdownHandler[] = [];
  private timeout: number;
  private isShuttingnDown: boolean = false;

  constructor(timeout: number = 1000) {
    this.timeout = timeout;
  }

  register(handler: ShutdownHandler): void {
    this.handlers.push(handler)
  }

  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingnDown) return;
    this.isShuttingnDown = true;

    console.log(`Received signal ${signal}, shutting down gracefully...`)

    const shutdownTimeout = setTimeout(() => {
      console.error('Shutdown timeout - forcing exit');
      process.exit(1);
    }, this.timeout);

    try {
      // Execute handlers in reverse order (LIFO)
      for (const handler of [...this.handlers].reverse()) {
        await handler();
      }

      clearTimeout(shutdownTimeout);
      console.log("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      console.error(`Error during shutdown: ${error}`);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  }

  listen(): void {
    process.on('SIGTERM', () => this.shutdown('SIGTERM')) // Docker/Kubernetes stop
    process.on('SIGINT', () => this.shutdown('SIGINT')) // Ctrl+C in terminal
  }

}