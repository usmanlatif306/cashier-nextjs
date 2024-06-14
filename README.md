## NextJs Cashier (Stripe Connect)

NextJs Cashier Stripe provides an expressive, fluent interface to Stripe's subscription billing services. It handles almost all of the boilerplate subscription billing code you are dreading writing.
Stripe Connect is the core Stripe product for multi-party business models, including Marketplaces and Platforms. It allows a business to take a payment from a customer and split it between several other businesses.

#### Features

**1:** Customer account is creating on stripe when he sign up.

**2:** Customer can easily connect you customers to stripe connect by redirecting them to stripe onboarding process, their they complete the onbaording flow and then redirect back to app for futher processing.

**3:** Customer can create login links to stripe portal where they can see all his payput history and available infos about balance and many more informations.

**4:** Customer can create payments intent for paying any payment and can save his payment information for future payments using ACH.

**5:** Customer can verify his identity (KYC) using stripe identification process.

**6:** Customer can send payments to another customer.

**More features comming soon most importantly handling Stripe Subscriptions**

### Installation

First, install the dependencies package for project using the Composer package manager:

```bash
npm install
```

### Configuration

Rename the .env.example file to .env and write down all required veriables values mention in e.nv file.

For database I am using SQLite database but you are free to use any database according to your need.
If you plan to go with SQLite, I have make a db file with name "cashier.db", you are free to rename but make sure you also rename the database name in .env file as well.
Database schema is defind in "/prisma/schema.prisma" file you can change the database schema according to your needs.

After setting up the database please run the following command so that your database schema synchronization with database.

```bash
npx prisma db push
```

### API Keys

Next, you should configure your Stripe API keys in your application's .env file. You can retrieve your Stripe API keys from the Stripe control panel:

```bash
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

**You should ensure that the STRIPE_WEBHOOK_SECRET environment variable is defined in your application's .env file, as this variable is used to ensure that incoming webhooks are actually from Stripe.**

### Testing

After you setup the things correctly, please run following commands to test your application in browser:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
