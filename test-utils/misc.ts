
export interface DbConfig {
    host?: string;
    user?: string;
    password?: string;
    database?: string;
    port?: string | number;

    // number of milliseconds to wait before timing out when connecting a new client
    // by default this is 0 which means no timeout
    connectionTimeoutMillis?: number;

    // number of milliseconds a client must sit idle in the pool and not be checked out
    // before it is disconnected from the backend and discarded
    // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
    idleTimeoutMillis?: number;

    // maximum number of clients the pool should contain
    // by default this is set to 10.
    max?: number;
}