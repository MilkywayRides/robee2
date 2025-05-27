import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className='flex justify-center'>
      <small className='text-muted-foreground'>
        Created by
        <Button
          variant='link'
          className='text-muted-foreground text-xs px-2'
          asChild
        >
          <Link
            href='https://github.com/Devambience'
            target='_blank'
            rel='noopener noreferrer'
          >
            Ankit
          </Link>
        </Button>
        &copy; {new Date().getFullYear()}.
      </small>
    </footer>
  );
}
