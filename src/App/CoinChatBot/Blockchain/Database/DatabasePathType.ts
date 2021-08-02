export type DatabasePathType =
    "/docs/{language}/help" |

    "/wallet/{wallet-id}" |

    "/whois/twitch/{twitch-user-name}" |
    "/whois/twitch/outdated/{twitch-user-name}-{index}" |

    "/quote/current" |
    "/quote/pack-{index}" |

    "/broker/{coin-main}/buy/{coin-pair}/wallet/{wallet-id}}" |
    "/broker/{coin-main}/buy/{coin-pair}/book" |
    "/broker/{coin-main}/sell/{coin-pair}/wallet/{wallet-id}" |
    "/broker/{coin-main}/sell/{coin-pair}/book" |
    "/broker/{coin-main}/amount" |

    "/transaction/sender/wallet/{wallet-id}" |
    "/transaction/sender/amount" |
    "/transaction/recipient/wallet/{wallet-id}" |
    "/transaction/recipient/amount" |

    "/balance/wallet/{wallet-id}" |
    "/balance/amount" |

    "/miner/{miner-type}/{wallet-id}" |
    "/miner/{miner-type}/history" |
    "/miner/{miner-type}/last" |

    "/withdraw/receipt/{receipt-id}" |
    "/withdraw/wallet/{wallet-id}" |
    "/withdraw/amount" |

    "/version";
