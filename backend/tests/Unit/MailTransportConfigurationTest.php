<?php

namespace Tests\Unit;

use Illuminate\Mail\MailManager;
use Symfony\Component\Mailer\Exception\UnsupportedSchemeException;
use Tests\TestCase;

class MailTransportConfigurationTest extends TestCase
{
    public function test_smtp_transport_rejects_tls_scheme(): void
    {
        $this->expectException(UnsupportedSchemeException::class);

        $transport = app(MailManager::class)->createSymfonyTransport([
            'transport' => 'smtp',
            'scheme' => 'tls',
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'username' => 'akrapidtrans@gmail.com',
            'password' => 'secret',
        ]);

        (string) $transport;
    }

    public function test_smtp_transport_defaults_to_plain_smtp_without_an_explicit_scheme(): void
    {
        $transport = app(MailManager::class)->createSymfonyTransport([
            'transport' => 'smtp',
            'host' => 'smtp.gmail.com',
            'port' => 587,
            'username' => 'akrapidtrans@gmail.com',
            'password' => 'secret',
        ]);

        $this->assertSame('smtp://smtp.gmail.com:587', (string) $transport);
    }
}